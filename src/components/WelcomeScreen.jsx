import { IoCloudUpload, IoCreate, IoDownload, IoBook, IoDocument, IoCode, IoSparkles } from 'react-icons/io5'

function WelcomeScreen() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 relative">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-indigo-500 rounded-xl flex items-center justify-center shadow-md">
              <IoBook className="w-11 h-11 text-white" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium mb-4">
            <IoSparkles className="w-3.5 h-3.5" />
            Professional Documentation Tool
          </div>
          <h1 className="text-5xl md:text-6xl mb-4 text-gray-900 font-bold tracking-tight">
            Markdown Viewer
          </h1>
          <p className="text-lg text-gray-600 mb-3 leading-relaxed max-w-2xl mx-auto">
            A clean, professional markdown documentation viewer
          </p>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xl mx-auto">
            Upload, edit, and preview your markdown files with ease
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg border border-gray-200 transition-all duration-200 hover:border-indigo-300 hover:shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <IoCloudUpload className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg mb-2 text-gray-900 font-semibold">Upload Files</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Drag and drop or click to upload your .md files
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 transition-all duration-200 hover:border-indigo-300 hover:shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <IoCreate className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg mb-2 text-gray-900 font-semibold">Live Editing</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Edit your markdown with real-time preview
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 transition-all duration-200 hover:border-indigo-300 hover:shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <IoDownload className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg mb-2 text-gray-900 font-semibold">Export Files</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Download your edited markdown files easily
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Key Features</h2>
            <p className="text-gray-600 text-sm">Everything you need for markdown documentation</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <IoCode className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Syntax Highlighting</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Beautiful code blocks with highlight.js support</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <IoDocument className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Multiple Files</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Manage and switch between multiple files</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <IoBook className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Table of Contents</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Auto-generated navigation from headings</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <IoCloudUpload className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Local Storage</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Files saved locally in your browser</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-lg font-medium shadow-sm hover:bg-indigo-600 transition-all duration-200 cursor-default">
            <IoSparkles className="w-4 h-4" />
            Get started by uploading your first file
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen

