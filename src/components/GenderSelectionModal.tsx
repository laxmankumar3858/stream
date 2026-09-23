import React, {useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Gender} from '../services/authService';

interface GenderSelectionModalProps {
  visible: boolean;
  onSave: (gender: Gender) => Promise<void>;
}

const GenderSelectionModal: React.FC<GenderSelectionModalProps> = ({
  visible,
  onSave,
}) => {
  const [selected, setSelected] = useState<Gender | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!selected || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      await onSave(selected);
    } catch {
      setError('Gender save nahi hua. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Select your gender</Text>
          <Text style={styles.subtitle}>
            Isse aapko opposite-gender matches dikhaye jayenge.
          </Text>

          <View style={styles.optionsRow}>
            {(['male', 'female'] as Gender[]).map(gender => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.option,
                  selected === gender && styles.optionSelected,
                ]}
                onPress={() => setSelected(gender)}
                activeOpacity={0.85}>
                <Text style={styles.optionEmoji}>{gender === 'male' ? '♂' : '♀'}</Text>
                <Text style={styles.optionText}>
                  {gender === 'male' ? 'Male' : 'Female'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.continueButton, !selected && styles.buttonDisabled]}
            disabled={!selected || isSaving}
            onPress={handleContinue}
            activeOpacity={0.85}>
            {isSaving ? (
              <ActivityIndicator color="#80065D" />
            ) : (
              <Text style={styles.continueText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(4, 2, 12, 0.82)',
  },
  card: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#21102E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 24,
  },
  option: {
    flex: 1,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  optionSelected: {
    borderColor: '#FF2A85',
    backgroundColor: 'rgba(255,42,133,0.2)',
  },
  optionEmoji: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  continueButton: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  continueText: {
    color: '#80065D',
    fontSize: 17,
    fontWeight: '900',
  },
  error: {
    color: '#FCA5A5',
    textAlign: 'center',
    marginBottom: 12,
  },
});

export default GenderSelectionModal;
