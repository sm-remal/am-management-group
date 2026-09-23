import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

const validateRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const parsedBody = schema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: parsedBody.error.flatten().fieldErrors,
            });
        }

        req.body = parsedBody.data;
        return next();
    };
};

export default validateRequest;
