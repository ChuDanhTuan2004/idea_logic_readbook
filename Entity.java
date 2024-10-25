// User.java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String password;
    private String fullName;
    private String email;
    
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// Book.java
@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String author;
    private String description;
    private String resourceUrl;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// BookAccessRequest.java
@Entity
@Table(name = "book_access_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookAccessRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;
    
    @Enumerated(EnumType.STRING)
    private RequestStatus status;
    
    private LocalDateTime requestDate;
    private LocalDateTime processedDate;
    
    @ManyToOne
    @JoinColumn(name = "processed_by")
    private User processedBy;
    
    private String reason;
    private String rejectionReason;
}

// Notification.java
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "request_id")
    private BookAccessRequest request;
    
    private String message;
    
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    
    private boolean isRead;
    private LocalDateTime createdAt;
}

// BookAccessPermission.java
@Entity
@Table(name = "book_access_permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookAccessPermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;
    
    private LocalDateTime grantedDate;
    private LocalDateTime expiryDate;
    private boolean isActive;
}
