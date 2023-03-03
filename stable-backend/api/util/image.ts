import sharp from 'sharp';

export const mergeImages = async (background: string, mask: string) => {
  const bgBuffer = Buffer.from(background.split(',')[1], 'base64');
  const maskBuffer = await sharp(Buffer.from(mask.split(',')[1], 'base64'))
    .resize(512, 512)
    .toBuffer();

  const merged = await sharp(bgBuffer)
    .resize(512, 512)
    .composite([{ input: maskBuffer }])
    .toFormat('jpg')
    .toBuffer();
  return merged.toString('base64');
};
