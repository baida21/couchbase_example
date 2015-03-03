package com.example.cblexample;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.Database;
import com.couchbase.lite.Document;
import com.couchbase.lite.Manager;
import com.couchbase.lite.Query;
import com.couchbase.lite.QueryEnumerator;
import com.couchbase.lite.UnsavedRevision;

import com.couchbase.lite.Mapper;
import com.couchbase.lite.Emitter;
import com.couchbase.lite.QueryRow;
import com.couchbase.lite.android.AndroidContext;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.View;

import android.view.MenuItem;


public class MainActivity extends Activity {

	private Manager cblManager;
	private Database cblDatabase;
	
	final String LOG_TAG = "CBLExample";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        initDatabase();
    }
    
    private void initDatabase()
    {
    	try {
    		cblManager = new Manager(new AndroidContext(this), Manager.DEFAULT_OPTIONS);
	    	cblManager.enableLogging(LOG_TAG, Log.INFO);
	    	
	    	cblDatabase = cblManager.getDatabase("example-db");
		} catch (Exception e) {
	    	Log.e(LOG_TAG, "Error = " + e);
		}
    }
    
    private void createDocument()
    {
    	Map<String, Object> props = new HashMap<String, Object>();
    	
    	props.put("type", "user_info");
    	props.put("user_id", "sean1@gmail.com");
    	props.put("name", "sean park");
    	
    	try {
        	Document doc = cblDatabase.createDocument();
        	doc.putProperties(props);
	    	Log.i(LOG_TAG, "도큐먼트 쓰기 성공  doc.id = " + doc.getId());
    	} catch(Exception e)
    	{
	    	Log.e(LOG_TAG, "Error = " + e);
    	}
    	
    }
    
    private void getDocument()
    {
    	String id = "0945f284-55a4-4537-b592-8b6463fd53a7";
    	Document doc = cblDatabase.getDocument(id);
    	Log.i(LOG_TAG, "도큐먼트 읽기 성공  doc = " + String.valueOf(doc.getProperties()));

    }
    
    private void putDocument()
    {
		try {
			String id = "0945f284-55a4-4537-b592-8b6463fd53a7";
			Document doc = cblDatabase.getDocument(id);
			
		  	Map<String, Object> newProps = new HashMap<String, Object>();
		  	newProps.putAll(doc.getProperties());
		  	newProps.put("hobby", "golf...");
		
			doc.putProperties(newProps);
			
			Log.i(LOG_TAG, "도큐먼트 put 업데이트 성공  doc = " + String.valueOf(doc.getProperties()));
		} catch (CouchbaseLiteException e) {
			Log.e(LOG_TAG, "도큐먼트 put 업데이트 성공  = " + e);
		}
      	
    }
    
    
    private void updateDocument()
    {
		try {
			String id = "0945f284-55a4-4537-b592-8b6463fd53a7";
			Document doc = cblDatabase.getDocument(id);
			
			doc.update(new Document.DocumentUpdater() {
				
				@Override
				public boolean update(UnsavedRevision newRevision) {
			    	
			      	Map<String, Object> newProps = newRevision.getProperties();
			      	newProps.put("hobby", "golf...");
			      	newRevision.setUserProperties(newProps);
					
					Log.i(LOG_TAG, "도큐먼트 update 성공  doc = " + String.valueOf(newRevision.getProperties()));
					return false;
				}
			});
			
		
		} catch (Exception e) {
			Log.e(LOG_TAG, "도큐먼트 update 에러 = " + e);
		}
    	
    }
    
    
    private void deleteDocument()
    {
		try {
			String id = "0945f284-55a4-4537-b592-8b6463fd53a7";
			Document doc = cblDatabase.getDocument(id);
			doc.delete();
			Log.i(LOG_TAG, "도큐먼트 삭제 성공");
		} catch (Exception e) {
			Log.e(LOG_TAG, "도큐먼트 삭제 에러  = " + e);
		}
    }
    
    
    private void createView()
    {
		try {
			com.couchbase.lite.View userListView = cblDatabase.getView("usrListView");
		
			userListView.setMap(new Mapper() 
			{
			    @Override
			    public void map(Map<String, Object> doc, Emitter emitter) {
			    	if(doc.get("type").equals("user_info")) {
		
			            emitter.emit(doc.get("name"), doc);
			        }
			    }
			}, "1");
			
			Log.i(LOG_TAG, "뷰 생성성공");
		
		} catch (Exception e) {
			Log.e(LOG_TAG, "뷰 생성 에러  = " + e);
		}
    }
    
    private void getView()
    {
    	try {
    		
		Query query = cblDatabase.getView("usrListView").createQuery();
		query.setDescending(false);
		query.setLimit(5);
		QueryEnumerator users = query.run();
		for(Iterator<QueryRow> row = users; row.hasNext();) {
			QueryRow user = row.next();
			Log.i(LOG_TAG, "도큐먼트 get View doc = " + user.getValue());
		}
			
		} catch (Exception e) {
			Log.e(LOG_TAG, " getView 에러  = " + e);
		} 	
    }
    
    
    public void clickCreateDoc(View v)
    {
    	createDocument();
    }
    
    public void clickGetDoc(View v)
    {
    	getDocument();
    }
    
    public void clickPutDoc(View v)
    {
    	putDocument();
    }
    
    public void clickUpdateDoc(View v)
    {
    	updateDocument();
    }
    
    public void clickDeleteDoc(View v)
    {
    	deleteDocument();
    }
    
    public void clickCreateView(View v)
    {
    	createView();
    }
    
    public void clickGetView(View v)
    {
    	getView();
    }
    

}
