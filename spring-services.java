// BookAccessService.java
@Service
@Transactional
@Slf4j
public class BookAccessService {
    private final BookAccessRequestRepository requestRepository;
    private final BookAccessPermissionRepository permissionRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    @Autowired
    public BookAccessService(BookAccessRequestRepository requestRepository,
                           BookAccessPermissionRepository permissionRepository,
                           NotificationRepository notificationRepository,
                           UserRepository userRepository,
                           BookRepository bookRepository) {
        this.requestRepository = requestRepository;
        this.permissionRepository = permissionRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
    }

    public BookAccessRequest createAccessRequest(Long userId, Long bookId, String reason) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        // Check if user already has active permission
        Optional<BookAccessPermission> existingPermission = 
            permissionRepository.findByUserAndBookAndIsActive(user, book, true);
        if (existingPermission.isPresent()) {
            throw new IllegalStateException("User already has access to this book");
        }

        // Check if there's already a pending request
        Optional<BookAccessRequest> pendingRequest = 
            requestRepository.findByUserAndBookAndStatus(user, book, RequestStatus.PENDING);
        if (pendingRequest.isPresent()) {
            throw new IllegalStateException("User already has a pending request for this book");
        }

        BookAccessRequest request = new BookAccessRequest();
        request.setUser(user);
        request.setBook(book);
        request.setStatus(RequestStatus.PENDING);
        request.setReason(reason);
        request.setRequestDate(LocalDateTime.now());

        return requestRepository.save(request);
    }

    public BookAccessRequest processRequest(Long requestId, Long librarianId, boolean approved, String rejectionReason) {
        BookAccessRequest request = requestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        User librarian = userRepository.findById(librarianId)
            .orElseThrow(() -> new ResourceNotFoundException("Librarian not found"));

        request.setProcessedBy(librarian);
        request.setProcessedDate(LocalDateTime.now());
        request.setStatus(approved ? RequestStatus.APPROVED : RequestStatus.REJECTED);
        
        if (!approved) {
            request.setRejectionReason(rejectionReason);
        } else {
            // Create permission if approved
            BookAccessPermission permission = new BookAccessPermission();
            permission.setUser(request.getUser());
            permission.setBook(request.getBook());
            permission.setGrantedDate(LocalDateTime.now());
            permission.setActive(true);
            permissionRepository.save(permission);
        }

        // Create notification
        Notification notification = new Notification();
        notification.setUser(request.getUser());
        notification.setRequest(request);
        notification.setType(approved ? NotificationType.APPROVAL : NotificationType.REJECTION);
        notification.setMessage(approved ? 
            "Your request to access " + request.getBook().getTitle() + " has been approved." :
            "Your request to access " + request.getBook().getTitle() + " has been rejected: " + rejectionReason);
        notificationRepository.save(notification);

        return requestRepository.save(request);
    }

    public boolean checkAccessPermission(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        Optional<BookAccessPermission> permission = 
            permissionRepository.findByUserAndBookAndIsActive(user, book, true);
        return permission.isPresent();
    }
}

// BookAccessController.java
@RestController
@RequestMapping("/api/book-access")
@Slf4j
public class BookAccessController {
    private final BookAccessService bookAccessService;

    @Autowired
    public BookAccessController(BookAccessService bookAccessService) {
        this.bookAccessService = bookAccessService;
    }

    @PostMapping("/request")
    public ResponseEntity<BookAccessRequest> createRequest(
            @RequestBody BookAccessRequestDTO requestDTO) {
        BookAccessRequest request = bookAccessService.createAccessRequest(
            requestDTO.getUserId(), 
            requestDTO.getBookId(), 
            requestDTO.getReason()
        );
        return ResponseEntity.ok(request);
    }

    @PostMapping("/process/{requestId}")
    public ResponseEntity<BookAccessRequest> processRequest(
            @PathVariable Long requestId,
            @RequestBody ProcessRequestDTO processDTO) {
        BookAccessRequest request = bookAccessService.processRequest(
            requestId,
            processDTO.getLibrarianId(),
            processDTO.isApproved(),
            processDTO.getRejectionReason()
        );
        return ResponseEntity.ok(request);
    }

    @GetMapping("/check/{userId}/{bookId}")
    public ResponseEntity<Boolean> checkAccess(
            @PathVariable Long userId,
            @PathVariable Long bookId) {
        boolean hasAccess = bookAccessService.checkAccessPermission(userId, bookId);
        return ResponseEntity.ok(hasAccess);
    }
}
