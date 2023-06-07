let renderRow = ({item, index}) => {
    let idMessage = item.split(':');
    console.log('>>>ITEM', item);
    return (
      <View
        style={[
          styles.componentMessage,
          idMessage[0] == options.id
            ? styles.myMessageComponent
            : idMessage.length == 1
            ? styles.introMessage
            : styles.messageComponent,
        ]}>
        <Text
          style={idMessage.length == 1 ? styles.textIntro : styles.textMessage}>
          {item}
        </Text>
      </View>
    );
  };
export default renderRow;