import z from "zod";

const UpdateUserSchema = z.object({
    name: z.string()
        .min(3, "Name must be at least 3 characters long")
        .max(50, "Name must be at most 50 characters long"),
});


const PasswordChangeSchema = z.object({
    currrentPassword :z.string()
            .min(6, "Password must be at least 6 characters long"),
    newPassword : z.string()
            .min(6, "Password must be at least 6 characters long")
})


export {
    UpdateUserSchema,
    PasswordChangeSchema
}