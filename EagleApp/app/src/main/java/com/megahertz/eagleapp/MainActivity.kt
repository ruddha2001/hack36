package com.tutorialkart.webviewexample

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle
import kotlinx.android.synthetic.main.activity_main.*

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView.loadUrl("http://192.168.44.158:6600/")

    }
}
