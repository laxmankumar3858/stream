import { View, Text, Button } from 'react-native';

const SignupScreen = ({ navigation }: any) => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text>Signup Screen</Text>

      <Button title="Back to Login" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default SignupScreen;
