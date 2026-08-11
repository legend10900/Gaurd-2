package com.guard2.app;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class LockActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_lock);

        final EditText pinInput = findViewById(R.id.pinInput);
        Button unlockButton = findViewById(R.id.unlockButton);

        unlockButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String pin = pinInput.getText().toString();
                if ("1234".equals(pin)) { // Simple default PIN for now
                    finish();
                } else {
                    Toast.makeText(LockActivity.this, "Incorrect PIN", Toast.LENGTH_SHORT).show();
                    pinInput.setText("");
                }
            }
        });
    }

    @Override
    public void onBackPressed() {
        // Prevent going back to the locked app
        Intent startMain = new Intent(Intent.ACTION_MAIN);
        startMain.addCategory(Intent.CATEGORY_HOME);
        startMain.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(startMain);
    }
}
