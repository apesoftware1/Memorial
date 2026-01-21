import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'listings';

    // Create FormData for Cloudinary upload
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('upload_preset', uploadPreset);
    // Fixed: company is not defined here, and folder should be added to uploadFormData
    // const companyName = formData.get('company');
    // if (companyName) {
    //   uploadFormData.append("folder", companyName.replace(/\s+/g, "_"));
    // }
    uploadFormData.append('transformation', 'w_800,h_600,c_limit,q_auto,f_auto');

    // Upload to Cloudinary using upload_preset
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadFormData
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    });

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Upload failed' }, 
      { status: 500 }
    );
  }
}