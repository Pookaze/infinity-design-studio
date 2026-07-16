const mimeByExtension={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',avif:'image/avif'};

export async function importExistingContent(supabase,manifest,onProgress=()=>{}){
  const{data:userData,error:userError}=await supabase.auth.getUser();if(userError||!userData.user)throw userError||new Error('Owner session is required.');
  const userId=userData.user.id;
  const{data:profile,error:profileError}=await supabase.from('admin_users').select('role,is_active').eq('user_id',userId).single();
  if(profileError||profile.role!=='owner'||!profile.is_active)throw profileError||new Error('Owner access is required.');
  const{data:services,error:servicesError}=await supabase.from('services').select('id,slug');if(servicesError)throw servicesError;
  const serviceMap=Object.fromEntries(services.map(service=>[service.slug,service.id]));
  const studies=manifest?.studies||{};let projectCount=0,mediaCount=0;
  for(const [serviceSlug,study] of Object.entries(studies)){
    if(!serviceMap[serviceSlug]||!Array.isArray(study.images))continue;
    onProgress(`Importing ${study.title?.[0]||serviceSlug}…`);
    const mediaRows=[];
    for(let index=0;index<study.images.length;index++){
      const image=study.images[index],path=String(image.src||'');
      if(!/^assets\/images\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp|avif)$/i.test(path))continue;
      const response=await fetch(`../../${path}`,{cache:'force-cache'});if(!response.ok)throw new Error(`Unable to import ${path}`);
      const blob=await response.blob();if(!blob.size||blob.size>10485760)throw new Error(`Invalid image size for ${path}`);
      const extension=path.split('.').pop().toLowerCase(),mime=mimeByExtension[extension]||blob.type;
      const objectPath=`${userId}/migration/${serviceSlug}/${index+1}.${extension}`;
      const{error:uploadError}=await supabase.storage.from('cms-media').upload(objectPath,blob,{contentType:mime,upsert:true,cacheControl:'31536000'});if(uploadError)throw uploadError;
      const{data:publicData}=supabase.storage.from('cms-media').getPublicUrl(objectPath);
      const{data:mediaRow,error:mediaError}=await supabase.from('media').upsert({object_path:objectPath,public_url:publicData.publicUrl,original_name:path.split('/').pop(),mime_type:mime,width:Number(image.width)||null,height:Number(image.height)||null,size_bytes:blob.size,alt_en:image.alt?.[0]||study.title?.[0]||'',alt_zh:image.alt?.[1]||study.title?.[1]||'',uploaded_by:userId},{onConflict:'object_path'}).select().single();if(mediaError)throw mediaError;
      mediaRows.push(mediaRow);mediaCount++;
    }
    const slug=`${serviceSlug}-showcase`,now=new Date().toISOString();
    const{data:project,error:projectError}=await supabase.from('projects').upsert({service_id:serviceMap[serviceSlug],slug,title_en:study.title?.[0]||serviceSlug,title_zh:study.title?.[1]||study.title?.[0]||serviceSlug,short_description_en:study.overview?.[0]||'',short_description_zh:study.overview?.[1]||'',client_en:study.brand||'',client_zh:study.brand||'',year:2026,cover_media_id:mediaRows[0]?.id||null,status:'published',published_at:now,services_en:(study.deliverables||[]).map(v=>v[0]),services_zh:(study.deliverables||[]).map(v=>v[1]),created_by:userId,updated_by:userId},{onConflict:'slug'}).select().single();if(projectError)throw projectError;
    const sections=[
      ['overview',1,'Project Overview','项目概览',{text:study.overview?.[0]||''},{text:study.overview?.[1]||''}],
      ['showcase',2,'Project Showcase','项目展示',{text:'A continuous presentation of the completed work.'},{text:'完整展示已完成的项目成果。'}],
      ['design-system',3,'Design System','设计系统',{colors:study.colors||[],typography:study.type?.[0]||''},{colors:study.colors||[],typography:study.type?.[1]||''}],
      ['deliverables',4,'Final Deliverables','最终交付',{items:(study.deliverables||[]).map(v=>v[0])},{items:(study.deliverables||[]).map(v=>v[1])}]
    ].map(v=>({project_id:project.id,section_key:v[0],section_number:v[1],title_en:v[2],title_zh:v[3],content_en:v[4],content_zh:v[5]}));
    const{error:sectionError}=await supabase.from('project_sections').upsert(sections,{onConflict:'project_id,section_key'});if(sectionError)throw sectionError;
    for(let index=1;index<mediaRows.length;index++){const media=mediaRows[index];const{error}=await supabase.from('project_media').upsert({project_id:project.id,media_id:media.id,section_key:'showcase',caption_en:media.alt_en,caption_zh:media.alt_zh,sort_order:index},{onConflict:'project_id,media_id,section_key'});if(error)throw error}
    projectCount++;
  }
  return{projects:projectCount,media:mediaCount};
}
