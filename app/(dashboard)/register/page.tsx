import RegistrationFlow from '../../../components/RegistrationFlow';

export const metadata = { title: 'Join SecurBank' };

export default function RegisterPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-obsidian)', padding: '80px 24px 60px' }}>
      <RegistrationFlow />
    </div>
  );
}
