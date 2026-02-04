/* eslint-disable @typescript-eslint/no-explicit-any */
// app/profile/actions.ts
'use server'

import { z } from 'zod'; // Optional: for validation
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Define the schema for updates
const ProfileSchema = z.object({
  firstName: z.string().min(2, "نام باید حداقل ۲ حرف باشد").optional().or(z.literal('')),
  lastName: z.string().min(2, "نام خانوادگی باید حداقل ۲ حرف باشد").optional().or(z.literal('')),
  notifyTelegram: z.boolean(),
  notifyWeb: z.boolean(),
});

export async function updateProfile(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get("session")?.value);

  if (!session || !session.userId) {
    return { success: false, message: "لطفا مجددا وارد شوید" };
  }

  // Parse data
  const rawData = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    notifyTelegram: formData.get('notifyTelegram') === 'on', // Checkbox returns 'on' if checked
    notifyWeb: formData.get('notifyWeb') === 'on',
  };

  try {
    // Update Database
    await prisma.user.update({
      where: { id: session.userId as string },
      data: {
        firstName: rawData.firstName as string,
        lastName: rawData.lastName as string,
        notifyTelegram: rawData.notifyTelegram,
        notifyWeb: rawData.notifyWeb,
      },
    });

    revalidatePath('/profile');
    return { success: true, message: "تغییرات با موفقیت ذخیره شد" };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, message: "خطا در ذخیره اطلاعات" };
  }
}
