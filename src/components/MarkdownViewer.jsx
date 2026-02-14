import { useEffect, useRef } from 'react'
import { parseMarkdown } from '../utils/markdown'

function MarkdownViewer({ content, markdownViewerRef }) {

  useEffect(() => {
    if (markdownViewerRef.current) {
      const html = parseMarkdown(content)
      markdownViewerRef.current.innerHTML = html
      
      // Add IDs to headings for navigation
      const headings = markdownViewerRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.forEach(heading => {
        const id = heading.textContent.toLowerCase().replace(/[^\w]+/g, '-')
        heading.id = id
      })
    }
  }, [content])

  return (
    <div className="flex-1 overflow-y-auto px-8 py-12 bg-white markdown-content" ref={markdownViewerRef}>
      {/* Content will be rendered here */}
    </div>
  )
}

export default MarkdownViewer

