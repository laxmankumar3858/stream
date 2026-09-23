package com.stream.audioroute

import android.content.Context
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AudioRouteModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  private val audioManager =
    reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager

  override fun getName() = NAME

  @ReactMethod
  fun enableSpeaker(promise: Promise) {
    try {
      audioManager.mode = AudioManager.MODE_IN_COMMUNICATION

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val speaker = audioManager.availableCommunicationDevices.firstOrNull {
          it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER
        }
        if (speaker == null || !audioManager.setCommunicationDevice(speaker)) {
          throw IllegalStateException("Built-in speaker is unavailable")
        }
      } else {
        @Suppress("DEPRECATION")
        audioManager.isSpeakerphoneOn = true
      }

      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("AUDIO_ROUTE_FAILED", "Unable to enable speaker", error)
    }
  }

  @ReactMethod
  fun reset(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        audioManager.clearCommunicationDevice()
      } else {
        @Suppress("DEPRECATION")
        audioManager.isSpeakerphoneOn = false
      }
      audioManager.mode = AudioManager.MODE_NORMAL
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("AUDIO_ROUTE_RESET_FAILED", "Unable to reset audio route", error)
    }
  }

  companion object {
    const val NAME = "AudioRoute"
  }
}
