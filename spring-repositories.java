// UserRepository.java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}

// BookRepository.java
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
}

// BookAccessRequestRepository.java
@Repository
public interface BookAccessRequestRepository extends JpaRepository<BookAccessRequest, Long> {
    List<BookAccessRequest> findByUserOrderByRequestDateDesc(User user);
    List<BookAccessRequest> findByStatusOrderByRequestDateDesc(RequestStatus status);
    Optional<BookAccessRequest> findByUserAndBookAndStatus(User user, Book book, RequestStatus status);
}

// NotificationRepository.java
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserAndIsReadOrderByCreatedAtDesc(User user, boolean isRead);
}

// BookAccessPermissionRepository.java
@Repository
public interface BookAccessPermissionRepository extends JpaRepository<BookAccessPermission, Long> {
    Optional<BookAccessPermission> findByUserAndBookAndIsActive(User user, Book book, boolean isActive);
}
