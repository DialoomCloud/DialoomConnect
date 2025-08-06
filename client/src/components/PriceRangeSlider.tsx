import React from 'react';
import { Range, getTrackBackground } from 'react-range';

interface PriceRangeSliderProps {
  values: number[];
  onChange: (values: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  values,
  onChange,
  min = 0,
  max = 200,
  step = 10,
  className = ""
}) => {
  return (
    <div className={`price-range-slider ${className}`}>
      <Range
        values={values}
        step={step}
        min={min}
        max={max}
        onChange={onChange}
        renderTrack={({ props, children }) => (
          <div
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            style={{
              ...props.style,
              height: '36px',
              display: 'flex',
              width: '100%'
            }}
          >
            <div
              ref={props.ref}
              style={{
                height: '6px',
                width: '100%',
                borderRadius: '4px',
                background: getTrackBackground({
                  values,
                  colors: ['#e2e8f0', '#00b4d8', '#e2e8f0'],
                  min,
                  max
                }),
                alignSelf: 'center'
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props, isDragged, index }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '20px',
              width: '20px',
              borderRadius: '50%',
              backgroundColor: '#00b4d8',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0px 2px 6px #AAA',
              border: '2px solid #ffffff',
              outline: 'none'
            }}
            className={`thumb ${isDragged ? 'dragged' : ''}`}
          >
            <div
              style={{
                position: 'absolute',
                top: '-28px',
                color: '#00b4d8',
                fontWeight: 'bold',
                fontSize: '12px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                padding: '2px 4px',
                borderRadius: '4px',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap'
              }}
            >
              €{values[index]}
            </div>
          </div>
        )}
      />
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>€{min}</span>
        <span>€{max}+</span>
      </div>
    </div>
  );
};

export default PriceRangeSlider;