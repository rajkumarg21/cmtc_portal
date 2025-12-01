import React from 'react'
import DynamicRenderer from '../dynamic/DynamicRenderer'


export default function GenericSection({section}){
return (
<div style={{margin:'24px 0'}}>
<h2>{section.title}</h2>
<DynamicRenderer schema={section.schema} itemsEndpoint={`/api/${section.tenant}/content/section/${section.id}`} />
</div>
)
}