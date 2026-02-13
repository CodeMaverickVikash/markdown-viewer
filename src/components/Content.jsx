import { useState } from 'react'
import { Menu, Edit, Download, Save, X, ChevronUp, FileText } from 'lucide-react'
import MarkdownViewer from './MarkdownViewer'
import MarkdownEditor from './MarkdownEditor'
import WelcomeScreen from './WelcomeScreen'
import { downloadMarkdown } from '../utils/markdown'

function Content({ file, onFileUpdate, onToggleSidebar, sidebarVisible }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editContent, setEditContent] = useState('')

  const handleEdit = () => {
    setEditContent(file.content)
    setIsEditMode(true)
  }

  const handleSave = () => {
    onFileUpdate(file.id, editContent)
    setIsEditMode(false)
  }

  const handleCancel = () => {
    setIsEditMode(false)
    setEditContent('')
  }

  const handleExport = () => {
    if (file) {
      downloadMarkdown(file.name, file.content)
    }
  }

  return (
    <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
      {/* Sidebar Toggle Button */}
      {!file && (
        <button
          className="flex items-center justify-center border border-neutral-200 cursor-pointer text-neutral-800 transition-all duration-200 p-2.5 w-10 h-10 rounded-lg fixed top-4 left-4 z-50 bg-white shadow-md hover:scale-105 hover:bg-neutral-50 hover:border-primary-500 active:scale-95"
          onClick={onToggleSidebar}
          title={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {file ? (
        <>
          <div className="flex justify-between items-center px-10 py-4 bg-sidebar border-b border-neutral-200 gap-4 flex-wrap relative">
            {/* Sidebar Toggle Button - In Header */}
            <button
              className="flex items-center justify-center cursor-pointer text-white transition-all duration-200 p-2 w-9 h-9 rounded-lg absolute left-2 top-1/2 -translate-y-1/2 hover:bg-white/10 active:scale-95"
              onClick={onToggleSidebar}
              title={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="text-xl font-semibold text-white flex items-center gap-2 ml-10">
              <FileText className="w-5 h-5" />
              {file.name}
            </div>
            <div className="flex gap-2 flex-wrap">
              {!isEditMode ? (
                <>
                  <button
                    className="bg-primary-500 text-white px-4 py-2 rounded-md cursor-pointer text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                    onClick={handleEdit}
                    title="Edit markdown"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    className="bg-primary-500 text-white px-4 py-2 rounded-md cursor-pointer text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                    onClick={handleExport}
                    title="Export to .md file"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="bg-success text-white px-4 py-2 rounded-md cursor-pointer text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:bg-success-600 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                    onClick={handleSave}
                    title="Save changes"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    className="bg-neutral-500 text-white px-4 py-2 rounded-md cursor-pointer text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:bg-neutral-600 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                    onClick={handleCancel}
                    title="Cancel editing"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          {isEditMode ? (
            <MarkdownEditor
              content={editContent}
              onChange={setEditContent}
            />
          ) : (
            <MarkdownViewer content={file.content} />
          )}

          {/* Scroll to Top Button - Only show when file is loaded */}
          <button
            className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 text-white border-none rounded-full cursor-pointer flex items-center justify-center shadow-lg transition-all duration-200 z-50 font-semibold hover:-translate-y-1 hover:shadow-xl"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="Scroll to top"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        </>
      ) : (
        <WelcomeScreen />
      )}
    </main>
  )
}

export default Content

