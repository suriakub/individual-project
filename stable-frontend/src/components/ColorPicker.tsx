import React, { useState } from 'react';
import reactCSS from 'reactcss';
import { SketchPicker, ColorResult} from 'react-color';

export default function ColorPicker (props: {color: string, setColor: (color: string) => void}) {
  const [display, setDisplay] = useState(false);

  const handleClick = () => {
    setDisplay(!display);
  };

  const handleClose = () => {
    setDisplay(false);
  };

  const handleChange = (color: ColorResult) => {
    props.setColor(color.hex);
  };

    const styles = reactCSS({
      default: {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: props.color,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          zIndex: '2',
        },
        cover: {
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

    return (
      <div>
        <div style={styles.swatch} onClick={handleClick}>
          <div style={styles.color} />
        </div>
        {display ? (
          <div style={{...styles.popover, position: 'absolute'}}>
            <div style={{...styles.cover, position: 'fixed' }} onClick={handleClose} />
            <SketchPicker
              color={props.color}
              onChange={handleChange}
            />
          </div>
        ) : null}
      </div>
    );
}
