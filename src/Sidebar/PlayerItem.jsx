import React, { useMemo, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { isColorTooLight } from '../shared/utils';
import { useGameController } from '../Contexts/hooks';

// Simple lock/unlock icons as SVGs
const LockIcon = ({ scale = 1.5 }) => (
  <svg
    width={16 * scale}
    height={16 * scale}
    viewBox="0 0 16 16"
    style={{ verticalAlign: 'middle' }}
  >
    {/* Lock body with black outline */}
    <rect
      x="3"
      y="7"
      width="10"
      height="6"
      rx="2"
      fill="#888"
      stroke="#000"
      strokeWidth="1"
    />
    {/* Lock shackle with black outline */}
    <path
      d="M5 7V5a3 3 0 1 1 6 0v2"
      stroke="#888"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M5 7V5a3 3 0 1 1 6 0v2"
      stroke="#000"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);
const UnlockIcon = ({ scale = 1.5 }) => (
  <svg
    width={16 * scale}
    height={16 * scale}
    viewBox="0 0 16 16"
    style={{ verticalAlign: 'middle' }}
  >
    {/* Lock body with black outline */}
    <rect
      x="3"
      y="7"
      width="10"
      height="6"
      rx="2"
      fill="#888"
      stroke="#000"
      strokeWidth="1"
    />
    {/* Lock shackle with black outline */}
    <path
      d="M11 7V5a3 3 0 0 0-6 0"
      stroke="#888"
      strokeWidth="1.5"
      fill="none"
    />
    <path d="M11 7V5a3 3 0 0 0-6 0" stroke="#000" strokeWidth="2" fill="none" />
  </svg>
);

export function PlayerItem({
  id,
  color,
  userId,
  nickname,
  lockedIn,
  isGroup,
  profilePic,
}) {
  const { handleUserSettingColor, userAddProfilePic } = useGameController();
  const [c, setColor] = useState(color);
  const [openColorPicker, setOpenColorPicker] = useState(false);
  const useBlack = useMemo(() => isColorTooLight(c), [c]);

  function truncateLabel(l) {
    if (!l) return 'Unknown';
    if (l.length > 17) {
      return l.slice(0, 17) + '... ';
    }
    return l;
  }

  const label = truncateLabel(nickname === '' ? id : nickname);
  // Ref for the color picker and list item
  const pickerRef = React.useRef(null);
  const itemRef = React.useRef(null);

  React.useEffect(() => {
    if (c !== color && openColorPicker === false) {
      setColor(color);
    }
  }, [c, color, handleUserSettingColor, openColorPicker]);

  React.useEffect(() => {
    if (!openColorPicker) return;

    function handleClickOutside(event) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        itemRef.current &&
        !itemRef.current.contains(event.target)
      ) {
        handleUserSettingColor(c);
        setOpenColorPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [c, handleUserSettingColor, openColorPicker]);

  function handleAddPhoto() {
    // get file from user
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        userAddProfilePic(file);
      }
    };
    input.click();
  }

  console.log(profilePic);

  return (
    <>
      <div
        style={{
          minWidth: 200,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 6,
        }}
      >
        <li
          key={id}
          ref={itemRef}
          style={{
            backgroundColor: c,
            color: useBlack ? '#000' : '#fff',
            padding: '8px 12px',
            width: '100%',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            cursor: userId === id ? 'pointer' : 'not-allowed',
          }}
          onClick={() => {
            if (userId !== id) {
              // Only allow the user to change their own color
              return;
            }
            setOpenColorPicker(true);
          }}
        >
          <span style={{ flex: 1 }}>{label}</span>
          {isGroup ? lockedIn ? <LockIcon /> : <UnlockIcon /> : null}
        </li>
        {userId === id && <button onClick={handleAddPhoto}>pfp</button>}
      </div>
      {openColorPicker && (
        <div ref={pickerRef}>
          <HexColorPicker
            color={c}
            onChange={(picked) => {
              setColor(picked);
            }}
          />
        </div>
      )}
    </>
  );
}
