/**
 * Review Form: modal content that lets authenticated travelers submit ratings with validation and mutation feedback.
 */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { useCreateReview } from "@/hooks/useReviews";
import { toast } from "sonner";

type ReviewFormProps = {
  tripId: string;
  onSuccess: () => void;
};

type FormValues = {
  rating: number;
  comment: string;
};

export function ReviewForm({ tripId, onSuccess }: ReviewFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const ratingValue = watch("rating");
  const mutation = useCreateReview(tripId);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (mutation.isSuccess) {
      toast.success("Thank you for sharing your experience!");
      reset();
      setSubmitError(null);
      onSuccess();
    }
  }, [mutation.isSuccess, onSuccess, reset]);

  useEffect(() => {
    if (mutation.isError) {
      const errorMessage =
        mutation.error instanceof Error ? mutation.error.message : "Failed to submit review.";
      setSubmitError(errorMessage);
    }
  }, [mutation.isError, mutation.error]);

  const onSubmit = (values: FormValues) => {
    if (values.rating < 1) {
      setSubmitError("Please select a rating between 1 and 5 stars.");
      return;
    }
    setSubmitError(null);
    mutation.mutate(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <input
          type="hidden"
          id="rating"
          {...register("rating", {
            min: { value: 1, message: "Please select a rating." },
            max: { value: 5, message: "Ratings can be up to 5 stars." },
          })}
        />
        <label className="text-sm font-medium text-gray-900" id="rating-label" htmlFor="rating">
          Rating
        </label>
        <StarRating
          rating={ratingValue}
          value={ratingValue}
          ariaLabelledBy="rating-label"
          onChange={(value) => setValue("rating", value, { shouldValidate: true })}
          size="lg"
        />
        {errors.rating && <p className="text-sm text-red-500">{errors.rating.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900" htmlFor="comment">
          Share your experience
        </label>
        <textarea
          id="comment"
          rows={4}
          placeholder="Tell fellow travelers what made this trip special."
          className="w-full resize-none rounded-lg border border-border bg-white p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-brown"
          {...register("comment", {
            required: "Please add a short comment.",
            minLength: { value: 10, message: "Comments should be at least 10 characters." },
            maxLength: { value: 1000, message: "Comments can be up to 1000 characters." },
          })}
        />
        {errors.comment && <p className="text-sm text-red-500">{errors.comment.message}</p>}
      </div>

      {submitError && <p className="text-sm text-red-500">{submitError}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending} className="min-w-[8rem]">
          {mutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting…
            </span>
          ) : (
            "Submit review"
          )}
        </Button>
      </div>
    </form>
  );
}

