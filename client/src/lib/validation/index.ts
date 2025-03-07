import * as z from "zod";
export const ForecastInputValidation = z.object({
  name: z
    .string()
    .min(2, { message: "Name should have at least two characters." }),

  feature: z.string().min(1, "Please select a feature from the list."),
});

export const ForecastInputValidationNbrx = z.object({
  name: z
    .string()
    .min(2, { message: "Name should have at least two characters." }),
  product: z.string().min(1, "Please select a brand from the list."),
  model: z.string().min(1, "Please select a model from the list."),
});
export const DownloadFileValidation = z.object({
  name: z
    .string()
    .min(1, { message: "File name should have at least one characters." }),
});
