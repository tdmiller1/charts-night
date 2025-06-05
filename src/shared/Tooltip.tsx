import React, { ReactNode, useState } from 'react';

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  bottom?: number; // Distance from the bottom of the button
  right?: number; // Distance from the right of the button
  left?: number; // Distance from the left of the button
};

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className,
  bottom = undefined,
  right = undefined,
  left = undefined,
}) => {
  const [visible, setVisible] = useState(false);

  // Check if the only child is a button with position: fixed
  let isFixed = false;
  if (React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      style?: React.CSSProperties;
    }>;
    if (child.props.style && child.props.style.position === 'fixed') {
      isFixed = true;
    }
  }

  return (
    <span
      className={`tooltip-wrapper ${className ?? ''}`}
      style={{
        position: isFixed ? 'static' : 'relative',
        display: 'inline-block',
      }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          className="tooltip-content"
          style={{
            position: isFixed ? 'fixed' : 'absolute',
            bottom: isFixed ? bottom : '100%', // 64px above the button if fixed, else above parent
            right: isFixed ? right : undefined,
            left: isFixed ? left : '50%',
            transform: isFixed ? undefined : 'translateX(-50%)',
            marginBottom: isFixed ? undefined : 8,
            background: '#222',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: 4,
            whiteSpace: 'nowrap',
            zIndex: 1000,
            fontSize: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            pointerEvents: 'auto',
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
