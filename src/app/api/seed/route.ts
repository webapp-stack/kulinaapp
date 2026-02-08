import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const sampleProducts = [] 

export async function POST() {
  try {
    // Menghapus data lama (opsional)
    await db.product.deleteMany({});
    
    // Karena sampleProducts kosong, ini tidak akan memasukkan apa-apa
    if (sampleProducts.length > 0) {
      await db.product.createMany({
        data: sampleProducts
      });
    }

    return NextResponse.json({ message: "Seed successful" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
  }
}
