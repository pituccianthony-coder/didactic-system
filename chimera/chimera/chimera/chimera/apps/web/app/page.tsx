import { PortalCanvas } from "@/components/PortalCanvas";
import { Ritual } from "@/components/Ritual";
export default function HomePage() {
  return (
    <main>
      <Ritual />
      <PortalCanvas />
      <div style={{ position: 'relative', zIndex: 1, color: 'white', textAlign: 'center', paddingTop: '40vh' }}>
        <h1>Project Chimera</h1>
        <p>The system is waking up...</p>
      </div>
    </main>
  );
}
