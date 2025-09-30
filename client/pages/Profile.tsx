/**
 * Profile Page: lets authenticated users update their name and avatar while reusing cached profile data.
 */
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/useUser";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { useToast } from "@/hooks/use-toast";

type ProfileFormValues = {
  full_name: string;
  avatar_url: string;
  avatar_file?: FileList;
};

export default function Profile() {
  const { data: user, isLoading } = useUser();
  const { mutateAsync, isPending } = useUpdateUser();
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      full_name: "",
      avatar_url: "",
    },
  });

  const watchedAvatarFile = watch("avatar_file");
  const watchedAvatarUrl = watch("avatar_url");

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name ?? "",
        avatar_url: user.avatar_url ?? "",
        avatar_file: undefined,
      });
      setAvatarPreview(user.avatar_url ?? null);
    }
  }, [user, reset]);

  useEffect(() => {
    if (watchedAvatarFile && watchedAvatarFile.length > 0) {
      const file = watchedAvatarFile[0];
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    return undefined;
  }, [watchedAvatarFile]);

  useEffect(() => {
    if (!watchedAvatarFile || watchedAvatarFile.length === 0) {
      const trimmed = watchedAvatarUrl?.trim();
      if (trimmed) {
        setAvatarPreview(trimmed);
      } else {
        setAvatarPreview(user?.avatar_url ?? null);
      }
    }
  }, [watchedAvatarUrl, watchedAvatarFile, user?.avatar_url]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const sanitizedName = values.full_name?.trim() ?? "";
      const sanitizedAvatarUrl = values.avatar_url?.trim() ?? "";

      await mutateAsync({
        full_name: sanitizedName.length > 0 ? sanitizedName : null,
        avatar_url: sanitizedAvatarUrl.length > 0 ? sanitizedAvatarUrl : null,
      });

      toast({
        title: "Profile updated",
        description: "Your profile details were saved successfully.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile.";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const isSaving = isSubmitting || isPending;

  const seoTitle = useMemo(() => {
    if (user?.full_name) {
      return `${user.full_name}'s profile`;
    }
    if (user?.email) {
      return `${user.email}'s profile`;
    }
    return "Profile settings";
  }, [user?.email, user?.full_name]);

  const seoDescription = "Manage your Trvlsync profile, update personal details, and refresh your avatar for future trips.";

  return (
    <>
      <Seo title={seoTitle} description={seoDescription} />
      <Header />
      <main className="px-6 pb-20 pt-32 lg:px-12" aria-labelledby="profile-heading">
        <div className="mx-auto max-w-3xl space-y-12">
          <section className="space-y-6">
            <div className="flex items-start gap-6">
              <Avatar src={avatarPreview} size="lg" />
              <div>
                <h1 id="profile-heading" className="text-3xl font-light text-gray-900 lg:text-4xl">
                  Profile settings
                </h1>
                <p className="text-gray-600">
                  Update your personal details so we can tailor every adventure to you.
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="profile-form-title" className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 id="profile-form-title" className="text-xl font-semibold text-gray-900">
              Personal information
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-8" aria-describedby="profile-form-help" aria-busy={isSaving}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email ?? ""} readOnly disabled className="bg-gray-100" aria-describedby="email-helper" />
                <p id="email-helper" className="text-xs text-gray-500">
                  Email addresses are used for bookings and cannot be changed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  placeholder="Add your name"
                  autoComplete="name"
                  {...register("full_name")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  placeholder="https://example.com/avatar.jpg"
                  {...register("avatar_url")}
                  aria-describedby="avatar-url-help"
                />
                <p id="avatar-url-help" className="text-xs text-gray-500">
                  Paste a publicly accessible image URL. Selecting a file below will update the preview and can be wired to storage later.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_file">Upload avatar</Label>
                <Input
                  id="avatar_file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  {...register("avatar_file")}
                  aria-describedby="avatar-upload-help"
                />
                <p id="avatar-upload-help" className="text-xs text-gray-500">
                  Avatar uploads to Supabase Storage will be enabled in a future update.
                </p>
              </div>

              <p id="profile-form-help" className="sr-only">
                Save changes when you are done editing your profile details.
              </p>

              <div className="flex items-center justify-end gap-3">
                <Button type="submit" disabled={isSaving || isLoading} className="rounded-full">
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
