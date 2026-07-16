import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const json=(body:unknown,status=200,origin='')=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','access-control-allow-origin':origin||'null','access-control-allow-headers':'authorization, apikey, content-type','access-control-allow-methods':'POST, OPTIONS','vary':'Origin'}});
const allowedOrigins=()=>new Set((Deno.env.get('ALLOWED_ADMIN_ORIGIN')||'').split(',').map(v=>v.trim()).filter(Boolean));

Deno.serve(async request=>{
  const origin=request.headers.get('origin')||'';
  if(request.method==='OPTIONS') return allowedOrigins().has(origin)?json({},204,origin):json({error:'Origin not allowed'},403,origin);
  if(request.method!=='POST'||!allowedOrigins().has(origin)) return json({error:'Forbidden'},403,origin);
  try{
    const url=Deno.env.get('SUPABASE_URL')!,serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const token=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
    const admin=createClient(url,serviceKey,{auth:{persistSession:false}});
    const{data:userData,error:userError}=await admin.auth.getUser(token);
    if(userError||!userData.user) return json({error:'Authentication required'},401,origin);
    const{data:profile}=await admin.from('admin_users').select('role,is_active').eq('user_id',userData.user.id).maybeSingle();
    if(!profile?.is_active||profile.role!=='owner') return json({error:'Owner access required'},403,origin);
    const body=await request.json(),studies=body?.manifest?.studies;
    if(!studies||typeof studies!=='object'||Object.keys(studies).length>30) return json({error:'Invalid migration manifest'},400,origin);
    const{data:services,error:servicesError}=await admin.from('services').select('id,slug');
    if(servicesError) throw servicesError;
    const serviceMap=Object.fromEntries((services||[]).map(service=>[service.slug,service.id]));
    let projectCount=0,mediaCount=0;
    for(const [serviceSlug,studyValue] of Object.entries(studies)){
      const study=studyValue as any;
      if(!/^[a-z0-9-]+$/.test(serviceSlug)||!serviceMap[serviceSlug]||!Array.isArray(study.images)||study.images.length>20) continue;
      const mediaRows=[];
      for(let index=0;index<study.images.length;index++){
        const image=study.images[index],path=String(image.src||'');
        if(!/^assets\/images\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp|avif)$/i.test(path)) continue;
        const assetResponse=await fetch(new URL(`/${path}`,origin));
        if(!assetResponse.ok) throw new Error(`Unable to import ${path}`);
        const bytes=new Uint8Array(await assetResponse.arrayBuffer());
        if(!bytes.length||bytes.length>10485760) throw new Error(`Invalid image size for ${path}`);
        const contentType=assetResponse.headers.get('content-type')?.split(';')[0]||'image/webp';
        if(!['image/jpeg','image/png','image/webp','image/avif'].includes(contentType)) throw new Error(`Unsupported image type for ${path}`);
        const extension=path.split('.').pop()!.toLowerCase(),objectPath=`migration/${serviceSlug}/${index+1}.${extension}`;
        const{error:uploadError}=await admin.storage.from('cms-media').upload(objectPath,bytes,{contentType,upsert:true,cacheControl:'31536000'});if(uploadError)throw uploadError;
        const{data:publicData}=admin.storage.from('cms-media').getPublicUrl(objectPath);
        const{data:mediaRow,error:mediaError}=await admin.from('media').upsert({object_path:objectPath,public_url:publicData.publicUrl,original_name:path.split('/').pop(),mime_type:contentType,width:Number(image.width)||null,height:Number(image.height)||null,size_bytes:bytes.length,alt_en:image.alt?.[0]||study.title?.[0]||'',alt_zh:image.alt?.[1]||study.title?.[1]||'',uploaded_by:userData.user.id},{onConflict:'object_path'}).select().single();if(mediaError)throw mediaError;
        mediaRows.push(mediaRow);mediaCount++;
      }
      const slug=`${serviceSlug}-showcase`,now=new Date().toISOString();
      const{data:project,error:projectError}=await admin.from('projects').upsert({service_id:serviceMap[serviceSlug],slug,title_en:study.title?.[0]||serviceSlug,title_zh:study.title?.[1]||study.title?.[0]||serviceSlug,short_description_en:study.overview?.[0]||'',short_description_zh:study.overview?.[1]||'',client_en:study.brand||'',client_zh:study.brand||'',year:2026,cover_media_id:mediaRows[0]?.id||null,status:'published',published_at:now,services_en:(study.deliverables||[]).map((v:any)=>v[0]),services_zh:(study.deliverables||[]).map((v:any)=>v[1]),created_by:userData.user.id,updated_by:userData.user.id},{onConflict:'slug'}).select().single();if(projectError)throw projectError;
      const sectionRows=[
        ['overview',1,'Project Overview','项目概览',{text:study.overview?.[0]||''},{text:study.overview?.[1]||''}],
        ['showcase',2,'Project Showcase','项目展示',{text:'A continuous presentation of the completed work.'},{text:'完整展示已完成的项目成果。'}],
        ['design-system',3,'Design System','设计系统',{colors:study.colors||[],typography:study.type?.[0]||''},{colors:study.colors||[],typography:study.type?.[1]||''}],
        ['deliverables',4,'Final Deliverables','最终交付',{items:(study.deliverables||[]).map((v:any)=>v[0])},{items:(study.deliverables||[]).map((v:any)=>v[1])}]
      ].map(v=>({project_id:project.id,section_key:v[0],section_number:v[1],title_en:v[2],title_zh:v[3],content_en:v[4],content_zh:v[5]}));
      const{error:sectionError}=await admin.from('project_sections').upsert(sectionRows,{onConflict:'project_id,section_key'});if(sectionError)throw sectionError;
      for(let index=1;index<mediaRows.length;index++){const{error}=await admin.from('project_media').upsert({project_id:project.id,media_id:mediaRows[index].id,section_key:'showcase',caption_en:mediaRows[index].alt_en,caption_zh:mediaRows[index].alt_zh,sort_order:index},{onConflict:'project_id,media_id,section_key'});if(error)throw error}
      projectCount++;
    }
    return json({ok:true,projects:projectCount,media:mediaCount},200,origin);
  }catch(error){console.error(error);return json({error:error instanceof Error?error.message:'Import failed'},500,origin)}
});
