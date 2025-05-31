import { useCurrentUser } from './Contexts/CurrentUserContext';

export default function Header() {
  const { lockedIn, setLockedIn } = useCurrentUser();
  return (
    <>
      <div>Game Master</div>
      <div>
        <button onClick={() => setLockedIn((prev) => !prev)}>
          {lockedIn ? 'Unlock Please' : 'Lock In'}
        </button>
      </div>
    </>
  );
}
