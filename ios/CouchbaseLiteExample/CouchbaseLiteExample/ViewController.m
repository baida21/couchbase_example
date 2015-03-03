//
//  ViewController.m
//  CouchbaseLiteExample
//
//  Created by Park Sean on 2014. 10. 25..
//  Copyright (c) 2014년 Park Sean. All rights reserved.
//

#import "ViewController.h"
#import "CouchbaseLite/CouchbaseLite.h"

@interface ViewController ()
{
    CBLManager *cblManager;
    CBLDatabase *cblDB;
    
    //for replicaiton
    CBLReplication * cblPull;
    CBLReplication * cblPush;
    
}
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    [self initDatabase];
    [self initReplication];
    [self setNotification];
}


- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)initDatabase
{
    cblManager = [CBLManager sharedInstance];
    if(!cblManager) {
        NSLog(@"%s CouchbaseLite manager 생성 실패", __FUNCTION__);
        exit(-1);
    }
    
    NSError *error;
    
    cblDB = [cblManager databaseNamed:@"example_db" error: &error];
    if(!cblDB) {
        NSLog(@"%s CouchbaseLite 데이터베이스 가져오기 실패", __FUNCTION__);
        exit(-1);;
    }
}




- (void)createDocument
{
    NSDictionary * userDic = @{@"type": @"user_info",
                               @"user_id" : @"sean2@gmail.com",
                               @"name" : @"sean park2"
                               };
    CBLDocument *doc = [cblDB createDocument];
    NSError * error;
    
    if(![doc putProperties:userDic error:&error]) {
         NSLog(@"%s 도큐먼트 쓰기 에러", __FUNCTION__);
    } else {
        NSLog(@"%s 도큐먼트 쓰기 성공 id = %@", __FUNCTION__, doc.documentID);
    }
}


- (void)getDocument
{
    NSString *docId = @"F55737ED-47F7-44E4-98D7-D4872AAAD5F2";
    CBLDocument *doc = [cblDB documentWithID:docId];
    
    NSLog(@"%s 도큐먼트 가져옴 doc = %@", __FUNCTION__, [doc properties]);
    
}


- (void)putDocument
{
    NSString *docId = @"F55737ED-47F7-44E4-98D7-D4872AAAD5F2";
    CBLDocument *doc = [cblDB documentWithID:docId];
    
    NSMutableDictionary *updatedProperties = [[doc properties] mutableCopy];
    updatedProperties[@"hobby"] = @"golf..";
    
    NSError * error;
    
    if(![doc putProperties:updatedProperties error:&error]) {
        NSLog(@"%s 도큐먼트 업데이트 에러", __FUNCTION__);
    } else {
        NSLog(@"%s 도큐먼트 업데이트 성공 id = %@", __FUNCTION__, doc.documentID);
    }
    
}

- (void)updateDocument
{
    NSString *docId = @"F55737ED-47F7-44E4-98D7-D4872AAAD5F2";
    CBLDocument *doc = [cblDB documentWithID:docId];
    
    NSError * error;
    
    if(![doc update: ^BOOL(CBLUnsavedRevision *newRevision) {
        newRevision[@"hobby"] = @"swimming..";
        NSLog(@"%s 도큐먼트 업데이트 성공 id = %@", __FUNCTION__, doc.documentID);
        return YES;
        
    } error : &error]) {
        NSLog(@"%s 도큐먼트 업데이트 에러", __FUNCTION__);
    }
    
}

- (void)deleteDocument
{
    NSString *docId = @"F55737ED-47F7-44E4-98D7-D4872AAAD5F2";
    CBLDocument *doc = [cblDB documentWithID:docId];
    NSError * error;
    [doc deleteDocument:&error];
    
}

-(void) createView
{
    CBLView *userListView = [cblDB viewNamed: @"userListView"];
    [userListView setMapBlock:MAPBLOCK({
        if([doc[@"type"] isEqualToString:@"user_info"]) {
            emit(doc[@"name"], doc);
        }
    }) version : @"1"];
    
}

-(void) getView
{
    CBLQuery *query = [[cblDB viewNamed:@"userListView"] createQuery];
    query.descending = NO;
    query.limit = 5;
    
    NSError * error;
    CBLQueryEnumerator *resultRows = [query run: &error];
    
    for(CBLQueryRow *row in resultRows) {
        NSString *value = row.value;
        NSLog(@"%s 부 로우 값 row.value= %@", __FUNCTION__, value);
    }
}

#pragma mark

-(IBAction)clickSave:(id)sender
{
    [self createDocument];
}

-(IBAction)clickGet:(id)sender
{
    [self getDocument];
}

-(IBAction)clickPut:(id)sender
{
    [self putDocument];
}

-(IBAction)clickUpdate:(id)sender
{
    [self updateDocument];
}

-(IBAction)clickDelete:(id)sender
{
    [self deleteDocument];
}

-(IBAction)clickCreateView:(id)sender
{
    [self createView];
}

-(IBAction)clickGetView:(id)sender
{
    [self getView];
}

#pragma mark - replication

- (void)initReplication
{
    NSURL *url = [NSURL URLWithString:@"http://localhost:4984/example_db"];
    cblPull = [cblDB createPullReplication:url];
    cblPush = [cblDB createPushReplication:url];

    id<CBLAuthenticator> auth = [CBLAuthenticator basicAuthenticatorWithName:@"sean1" password:@"12345"];

    cblPull.authenticator = cblPush.authenticator = auth;
    cblPush.continuous = YES;
    cblPull.continuous = YES;

    [cblPush start];
    [cblPull start];


    NSLog(@"%s 복제 초기화...", __FUNCTION__);
}

- (void)setNotification
{
    NSNotificationCenter *notiCenter = [NSNotificationCenter defaultCenter];
    [notiCenter addObserver:self selector:@selector(progressReplica:) name:kCBLReplicationChangeNotification object:cblPull];
    [notiCenter addObserver:self selector:@selector(progressReplica:) name:kCBLReplicationChangeNotification object:cblPush];
}

-(void) progressReplica:(NSNotificationCenter*) noti
{
    if(cblPull.status == kCBLReplicationActive || cblPull.status == kCBLReplicationActive) {
        int completedCount = cblPull.completedChangesCount + cblPush.completedChangesCount;
        int totalCount = cblPull.changesCount + cblPush.changesCount;
        
        NSLog(@"%s replication progress... %d / %d", __FUNCTION__, completedCount, totalCount);
    } else {
        // 복제 하지 않고 있음.
    }
}




@end
