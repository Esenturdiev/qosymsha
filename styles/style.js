import {StyleSheet} from 'react-native';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
  },
  messageBox: {
    margin: 16,
    flex: 1,
  },
  myMessageComponent: {
    backgroundColor: '#000000',
    color: 'white',
    borderRadius: 3,
    padding: 5,
    marginBottom: 5,
  },
  messageComponent: {
    marginBottom: 5,
    backgroundColor: '#0075e2',
    padding: 5,
    borderRadius: 3,
  },
  introMessage: {
    backgroundColor: 'black',
    borderRadius: 3,
    padding: 5,
    marginBottom: 5,
  },
  textInput: {
    height: 40,
    margin: 5,
    borderWidth: 1,
    padding: 5,
  },
  textIntro: {
    color: 'white',
    fontSize: 16,
  },
  textMessage: {
    color: 'white',
    fontSize: 16,
  },
  tinyLogo: {
    width: 50,
    height: 50,
    marginLeft: 5,
    marginRight: 10,
  },
  block: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    paddingBottom: 200,
  },
  row: {
    width: '45%',
    height: 120,
    justifyContent: 'space-between',
    marginTop: 15,
    marginLeft: 5,
    marginRight: 5,
    padding: 5,
    borderWidth: 2,
    borderRadius: '10%',
  },
  Switch: {

  },
  Window: {
 
    alignItems: 'center',
  },
  JASIK: {
    width: '100%',
    textAlign: 'center',
    fontSize: 26,
    marginBottom: 15,
  },
});
export default styles;
