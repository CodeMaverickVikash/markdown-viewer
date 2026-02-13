import { Upload, Edit, Download } from 'lucide-react'

function WelcomeScreen() {
  return (
    <div className="flex-1 overflow-y-auto p-10 bg-neutral-50 pt-5 pr-5">
      <div className="max-w-4xl mx-auto text-center p-8">
        <h1 className="text-4xl mb-4 text-neutral-800 font-extrabold tracking-tight">Welcome to Markdown Viewer</h1>
        <p className="text-lg text-neutral-600 mb-8 leading-relaxed">Upload your markdown files to get started</p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mt-12">
          <div className="p-8 bg-white border border-neutral-200 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-primary-500">
            <div className="flex justify-center mb-4">
              <Upload className="w-12 h-12 text-primary-500" />
            </div>
            <h3 className="text-lg mb-3 text-neutral-800 font-bold">Upload Files</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">Click the "Upload Files" button or drag and drop .md files</p>
          </div>

          <div className="p-8 bg-white border border-neutral-200 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-primary-500">
            <div className="flex justify-center mb-4">
              <Edit className="w-12 h-12 text-secondary-500" />
            </div>
            <h3 className="text-lg mb-3 text-neutral-800 font-bold">Edit Mode</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">Click "Edit" to modify your markdown files</p>
          </div>

          <div className="p-8 bg-white border border-neutral-200 rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-primary-500">
            <div className="flex justify-center mb-4">
              <Download className="w-12 h-12 text-success" />
            </div>
            <h3 className="text-lg mb-3 text-neutral-800 font-bold">Export</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">Download your edited files as .md</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen

