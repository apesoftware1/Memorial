import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { publicIds } = body || {};
    if (!publicIds || (Array.isArray(publicIds) && publicIds.length === 0)) {
      return NextResponse.json({ error: 'publicIds is required' }, { status: 400 });
    }

    const ids = Array.isArray(publicIds) ? publicIds : [publicIds];

    const results = [];
    for (const id of ids) {
      if (!id) continue;
      try {
        const res = await cloudinary.uploader.destroy(id, {
          invalidate: true,
          resource_type: 'image',
        });
        results.push({ public_id: id, result: res.result });
      } catch (err) {
        results.push({ public_id: id, error: err.message });
      }
    }

    return NextResponse.json({ deleted: results });
  } catch (err) {
    return NextResponse.json({ error: 'Cloudinary delete failed' }, { status: 500 });
  }
}