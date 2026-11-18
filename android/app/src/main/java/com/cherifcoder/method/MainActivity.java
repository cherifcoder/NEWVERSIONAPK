package com.cherifcoder.method;

import android.os.Bundle;

import com.cherifcoder.method.focus.FocusGuardPlugin;
import com.cherifcoder.method.focus.FocusManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Doit être appelé AVANT super.onCreate() pour que le plugin soit
        // enregistré auprès du bridge Capacitor.
        registerPlugin(FocusGuardPlugin.class);
        super.onCreate(savedInstanceState);

        // Filet de sécurité : si aucune session verrouillée n'est active, on
        // relâche tout (verrouillage absolu, service, surimpression).
        FocusManager.reconcile(getApplicationContext());
    }
}
