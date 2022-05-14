import React, {useState, useCallback} from 'react';
import {Text} from 'react-native';

const Desc = ({desc}) => {
  const [textShown, setTextShown] = useState(false);
  const [lengthMore, setLengthMore] = useState(false);

  const toggleNumberOfLines = () => {
    setTextShown(!textShown);
  };

  const onTextLayout = useCallback(e => {
    setLengthMore(e.nativeEvent.lines.length > 2);
  }, []);
  return (
    <>
      <Text
        onTextLayout={onTextLayout}
        numberOfLines={textShown ? undefined : 2}
        style={{
          fontSize: 15,
          textAlign: 'justify',
          color: '#444',
          marginHorizontal: 8,
          marginBottom: lengthMore ? 0 : 8,
        }}>
        {desc}
      </Text>
      {lengthMore ? (
        <Text
          onPress={toggleNumberOfLines}
          style={{
            color: '#999',
            marginHorizontal: 8,
            marginTop: 3,
            marginBottom: 8,
            fontSize: 14,
            alignSelf: 'flex-end',
          }}>
          {textShown ? 'Masquer' : 'Lire la suite...'}
        </Text>
      ) : null}
    </>
  );
};

export default Desc;
