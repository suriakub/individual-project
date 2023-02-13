import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

const evaluateValidations = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const textToImageValidator = [
  body('userId').exists().isInt(),
  body('args.prompt').exists().isString(),
  body('args.height').exists().isInt({ min: 128, max: 768 }),
  body('args.width').exists().isInt({ min: 128, max: 768 }),
  body('args.steps').exists().isInt({ min: 0, max: 100 }),
  body('args.seed').optional().isNumeric(),
  evaluateValidations,
];

export const imageToImageValidator = [
  body('userId').exists().isInt(),
  body('args.prompt').exists().isString(),
  body('args.image').exists().isString(),
  body('args.strength').exists().isFloat({ min: 0, max: 1 }),
  body('args.steps').exists().isInt({ min: 0, max: 100 }),
  body('args.seed').optional().isNumeric(),
  evaluateValidations,
];
