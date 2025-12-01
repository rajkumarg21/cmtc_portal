import React from 'react'
import NewsSection from './Sections/NewsSection'
import GallerySection from './Sections/GallerySection'
import GenericSection from './Sections/GenericSection'


const registry = {
news: NewsSection,
gallery: GallerySection,
}


export default function SectionFactory({section}){
const Comp = registry[section.key] || GenericSection
return <Comp section={section} />
}