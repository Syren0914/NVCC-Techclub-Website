import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // For now, we'll return a placeholder URL
    // In production, you'd upload to a service like Cloudinary, AWS S3, etc.
    const fileName = file.name
    const fileExtension = fileName.split('.').pop()
    const uniqueId = Date.now().toString()
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return a placeholder URL (replace with actual upload logic)
    const uploadedUrl = `https://via.placeholder.com/400x300/666666/FFFFFF?text=${encodeURIComponent(fileName)}`
    
    return NextResponse.json({
      success: true,
      url: uploadedUrl,
      fileName: fileName
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
