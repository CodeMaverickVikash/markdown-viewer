import { marked } from 'marked'
import hljs from 'highlight.js'

// Configure marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.error('Highlight error:', err)
      }
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

export const parseMarkdown = (content) => {
  return marked.parse(content || '')
}

export const extractHeadings = (content, level = 2) => {
  const headingRegex = new RegExp(`^#{${level}}\\s+(.+)$`, 'gm')
  const headings = []
  let match
  
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      text: match[1].trim(),
      id: match[1].trim().toLowerCase().replace(/[^\w]+/g, '-')
    })
  }
  
  return headings
}

export const downloadMarkdown = (filename, content) => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

