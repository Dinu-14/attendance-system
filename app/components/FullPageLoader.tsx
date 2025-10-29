// components/FullPageLoader.tsx
const FullPageLoader = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>Loading...</h2> {/* Or your fancy spinner component */}
    </div>
  );
};

export default FullPageLoader;