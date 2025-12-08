import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export function ShaderBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <ShaderGradientCanvas
        style={{ position: "absolute", inset: 0 }}
        pixelDensity={1}
        fov={45}
      >
        <ShaderGradient
          animate="on"
          brightness={1.1}
          cAzimuthAngle={180}
          cDistance={3.9}
          cPolarAngle={115}
          cameraZoom={1}
          color1="#5606ff"
          color2="#fe8989"
          color3="#000000"
          envPreset="city"
          grain="off"
          lightType="3d"
          positionX={-0.5}
          positionY={0.1}
          positionZ={0}
          reflection={0.1}
          rotationX={0}
          rotationY={0}
          rotationZ={235}
          type="waterPlane"
          uAmplitude={0}
          uDensity={1.1}
          uFrequency={5.5}
          uSpeed={0.1}
          uStrength={2.4}
          uTime={0.2}
          wireframe={false}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
