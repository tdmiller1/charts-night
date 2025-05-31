import './ImageLayout.css';

export default function ImageLayout({ images }) {
  // Responsive: use parent width/height and CSS variables
  const radiusPercent = 200; // percent of container's min-dimension

  return (
    <div className="image-layout-container">
      {images.map((img, idx) => {
        const angle = (2 * Math.PI * idx) / images.length - Math.PI / 2;
        // Use CSS calc and variables for responsive positioning
        const style = {
          '--angle': angle,
          '--radius': `${radiusPercent}%`,
        };
        return (
          <div key={idx} className="image-layout-item" style={style}>
            {img}
          </div>
        );
      })}
    </div>
  );
}
