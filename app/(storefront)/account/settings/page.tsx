import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/account";
import { AvatarUpload } from "@/components/storefront/account/AvatarUpload";
import { ProfileSettingsForm } from "@/components/storefront/account/ProfileSettingsForm";
import { PasswordChangeForm } from "@/components/storefront/account/PasswordChangeForm";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfile(user.id);
  if (!profile) return null;

  return (
    <div className="max-w-lg space-y-10">
      <h1 className="font-serif text-section text-ink">Settings</h1>

      <div>
        <h2 className="mb-4 text-body-lg text-ink">Photo</h2>
        <AvatarUpload userId={user.id} initialAvatarUrl={profile.avatar_url} />
      </div>

      <div>
        <h2 className="mb-4 text-body-lg text-ink">Profile</h2>
        <ProfileSettingsForm profile={profile} />
      </div>

      <div>
        <h2 className="mb-4 text-body-lg text-ink">Password</h2>
        <PasswordChangeForm />
      </div>
    </div>
  );
}
