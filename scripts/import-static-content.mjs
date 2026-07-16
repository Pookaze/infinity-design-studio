import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import vm from 'node:vm';
import { createClient } from '@supabase/supabase-js';

const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env');
const client=createClient(url,key,{auth:{persistSession:false}}),root=process.cwd();
const context={window:{}};vm.createContext(context);
vm.runInContext(await readFile(join(root,'work-data.js'),'utf8'),context);
vm.runInContext(await readFile(join(root,'case-study-data.js'),'utf8'),context);
const studies=context.window.infinityCaseStudies||{};
const {data:services,error:serviceError}=await client.from('services').select('id,slug');if(serviceError)throw serviceError;
const serviceMap=Object.fromEntries(services.map(s=>[s.slug,s.id]));
const mime={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.avif':'image/avif'};

for(const [serviceSlug,study] of Object.entries(studies)){
  if(!serviceMap[serviceSlug]){console.warn(`Skipping ${serviceSlug}: service missing`);continue}
  const media=[];
  for(let index=0;index<study.images.length;index++){
    const image=study.images[index],local=join(root,...image.src.split('/')),extension=extname(local).toLowerCase();
    if(!mime[extension])continue;
    const bytes=await readFile(local),info=await stat(local),objectPath=`migration/${serviceSlug}/${index+1}${extension}`;
    const{error:uploadError}=await client.storage.from('cms-media').upload(objectPath,bytes,{contentType:mime[extension],upsert:true,cacheControl:'31536000'});if(uploadError)throw uploadError;
    const{data:publicData}=client.storage.from('cms-media').getPublicUrl(objectPath);
    const{data:mediaRow,error:mediaError}=await client.from('media').upsert({object_path:objectPath,public_url:publicData.publicUrl,original_name:image.src.split('/').pop(),mime_type:mime[extension],width:image.width,height:image.height,size_bytes:info.size,alt_en:image.alt?.[0]||study.title[0],alt_zh:image.alt?.[1]||study.title[1]},{onConflict:'object_path'}).select().single();if(mediaError)throw mediaError;media.push(mediaRow);
  }
  const slug=`${serviceSlug}-showcase`;
  const{data:project,error:projectError}=await client.from('projects').upsert({service_id:serviceMap[serviceSlug],slug,title_en:study.title[0],title_zh:study.title[1],short_description_en:study.overview[0],short_description_zh:study.overview[1],client_en:study.brand,client_zh:study.brand,year:2026,cover_media_id:media[0]?.id,status:'published',published_at:new Date().toISOString(),services_en:study.deliverables.map(v=>v[0]),services_zh:study.deliverables.map(v=>v[1])},{onConflict:'slug'}).select().single();if(projectError)throw projectError;
  const sectionRows=[
    ['overview',1,'Project Overview','项目概览',{text:study.overview[0]},{text:study.overview[1]}],
    ['showcase',2,'Project Showcase','项目展示',{text:'A continuous presentation of the completed work.'},{text:'完整展示已完成的项目成果。'}],
    ['design-system',3,'Design System','设计系统',{colors:study.colors,typography:study.type[0]},{colors:study.colors,typography:study.type[1]}],
    ['deliverables',4,'Final Deliverables','最终交付',{items:study.deliverables.map(v=>v[0])},{items:study.deliverables.map(v=>v[1])}]
  ].map(v=>({project_id:project.id,section_key:v[0],section_number:v[1],title_en:v[2],title_zh:v[3],content_en:v[4],content_zh:v[5]}));
  const{error:sectionError}=await client.from('project_sections').upsert(sectionRows,{onConflict:'project_id,section_key'});if(sectionError)throw sectionError;
  for(let index=1;index<media.length;index++){const{error}=await client.from('project_media').upsert({project_id:project.id,media_id:media[index].id,section_key:'showcase',caption_en:media[index].alt_en,caption_zh:media[index].alt_zh,sort_order:index},{onConflict:'project_id,media_id,section_key'});if(error)throw error}
  console.log(`Imported ${study.title[0]} (${media.length} media files)`);
}
console.log('Static portfolio migration complete. Existing source files were not changed or deleted.');
