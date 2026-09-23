import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

import {
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
} from '../config/supabase';

const isConfigured = /^https:\/\/.+\.supabase\.co$/i.test(SUPABASE_URL);

// Keep app startup usable while local Supabase configuration is incomplete.
export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;
