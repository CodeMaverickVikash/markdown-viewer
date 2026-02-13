import { useRef } from 'react'
import { BookOpen, Upload, Search, FileText, X, FolderOpen } from 'lucide-react'
import { extractHeadings } from '../utils/markdown'

function Sidebar({
  files,
  currentFileId,
  onFileSelect,
  onFileRemove,
  onFileUpload,
  visible,
  searchQuery,
  onSearchChange
}) {
  const fileInputRef = useRef(null)

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length > 0) {
      onFileUpload(selectedFiles)
    }
    e.target.value = '' // Reset input
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.name.endsWith('.md') || file.name.endsWith('.markdown')
    )
    
    if (droppedFiles.length > 0) {
      onFileUpload(droppedFiles)
    }
  }

  const filesArray = Array.from(files.values())
  const filteredFiles = searchQuery
    ? filesArray.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filesArray

  return (
    <aside className={`${visible ? 'w-[300px]' : 'w-0 min-w-0 overflow-hidden'} bg-sidebar text-white flex flex-col shadow-lg transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 px-6 bg-gradient-to-r from-primary-500 to-secondary-500 flex-shrink-0">
        <h1 className="text-2xl mb-2 font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 flex-shrink-0 drop-shadow" />
          Markdown Viewer
        </h1>
        <div className="flex justify-center mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />
          <button
            className="px-5 py-2.5 bg-white/15 text-white border border-white/20 rounded-lg cursor-pointer text-sm font-semibold transition-all duration-200 hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-sm flex items-center gap-2"
            onClick={handleUploadClick}
            title="Upload markdown files"
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 px-6 bg-sidebar flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-lg text-sm outline-none transition-all duration-200 bg-white/5 text-white placeholder:text-white/50 focus:border-primary-500 focus:bg-white/10"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* File List */}
      <nav className="flex-1 overflow-y-auto py-4">
        {filteredFiles.length > 0 ? (
          <div>
            <h3 className="px-6 py-3.5 text-xs font-bold text-white/50 uppercase tracking-wider">Uploaded Files</h3>
            <ul className="list-none">
              {filteredFiles.map(file => {
                const headings = extractHeadings(file.content, 2)
                return (
                  <li key={file.id}>
                    <div
                      className={`flex justify-between items-center px-6 py-3 font-semibold ${currentFileId === file.id ? 'bg-primary-500' : 'bg-white/5'} border-l-3 border-primary-500 cursor-pointer transition-all duration-200 hover:bg-white/10`}
                      onClick={() => onFileSelect(file.id)}
                    >
                      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-2">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        {file.name}
                      </span>
                      <button
                        className="bg-error text-white w-6 h-6 rounded flex items-center justify-center transition-all duration-200 flex-shrink-0 ml-2 hover:bg-error-600 hover:scale-110 active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation()
                          onFileRemove(file.id)
                        }}
                        title="Remove this file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {currentFileId === file.id && headings.length > 0 && (
                      <ul className="list-none pl-8 mt-2 mb-2">
                        {headings.map((heading, idx) => (
                          <li key={idx} className="py-1.5">
                            <a href={`#${heading.id}`} className="text-white/70 no-underline text-sm transition-all duration-200 hover:text-white hover:pl-2">{heading.text}</a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <div
            className="p-12 px-8 text-center text-white/50 border-2 border-dashed border-white/20 rounded-xl mx-6 my-4 transition-all duration-300 flex flex-col items-center gap-2"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FolderOpen className="w-12 h-12 mb-2" />
            <p>No files uploaded</p>
            <p className="text-sm">Drag & drop .md files here</p>
          </div>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar

