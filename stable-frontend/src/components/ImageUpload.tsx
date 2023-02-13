import ImageUploading, {
  ImageListType,
  ImageType
} from 'react-images-uploading';

export default function ImageUpload({
  imageList,
  setImage
}: {
  imageList: ImageListType;
  setImage: (imageList: ImageListType) => void;
}) {
  const onChange = (imageList: ImageListType) => {
    // data for submit
    setImage(imageList);
  };

  const showImage = (image?: ImageType) => {
    const imgSrc =
      image == null ? `${process.env.PUBLIC_URL}/blank.jpg` : image.dataURL;

    return (
      <div className="relative cursor-pointer">
        {imageList.length > 0 ? (
          <></>
        ) : (
          <div className="absolute flex left-[17%] w-2/3 h-full items-center justify-center">
            <h1 className="text-2xl font-bold text-blue-700">
              Upload or drop image
            </h1>
          </div>
        )}
        <img className="object-contain w-full rounded-lg" src={imgSrc} alt="" />
      </div>
    );
  };

  return (
    <ImageUploading value={imageList} onChange={onChange} maxNumber={1}>
      {({
        imageList,
        onImageUpload,
        onImageRemoveAll,
        isDragging,
        dragProps
      }) => (
        <div className="upload__image-wrapper">
          <div
            className="max-w-md p-1 rounded-lg border-4 border-dashed border-gray-200"
            style={isDragging ? { color: 'blue' } : undefined}
            onClick={onImageUpload}
            {...dragProps}
          >
            {showImage(imageList[0])}
          </div>
          <button
            className="bg-red-600 hover:bg-red-500 font-bold text-white mx-2 py-2 px-4 rounded"
            onClick={onImageRemoveAll}
          >
            Remove Image
          </button>
        </div>
      )}
    </ImageUploading>
  );
}
