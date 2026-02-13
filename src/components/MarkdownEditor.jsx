function MarkdownEditor({ content, onChange }) {
  return (
    <textarea
      className="flex-1 p-10 bg-neutral-50 text-neutral-800 border-none font-mono text-[0.95rem] leading-relaxed resize-none outline-none overflow-y-auto"
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Write your markdown here..."
      spellCheck="false"
    />
  )
}

export default MarkdownEditor

