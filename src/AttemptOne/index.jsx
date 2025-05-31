export default function AttemptOne() {
  const [images, setImages] = useState([
    <img src={darcy} alt="Darcy Logo" width={100} />,
    <img src={darcy} alt="Darcy Logo" width={100} />,
    <img src={darcy} alt="Darcy Logo" width={100} />,
    <img src={darcy} alt="Darcy Logo" width={100} />,
    <img src={darcy} alt="Darcy Logo" width={100} />,
    <img src={darcy} alt="Darcy Logo" width={100} />,
    <img src={darcy} alt="Darcy Logo" width={100} />,
    <img src={darcy} alt="Darcy Logo" width={100} />,
  ]);

  return (
    <>
      <button>Add image</button>
      <div style={{ width: '100vw' }}>
        <ImageLayout images={images} />
      </div>
    </>
  );
}
