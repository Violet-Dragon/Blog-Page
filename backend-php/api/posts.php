<?php
session_start();
require_once 'config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Get single post
            $id = $conn->real_escape_string($_GET['id']);
            $stmt = $conn->prepare("SELECT * FROM blog_posts WHERE id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $post = $result->fetch_assoc();
                $post['tags'] = json_decode($post['tags'], true);
                $post['published'] = (bool)$post['published'];
                
                // Get FAQs
                $faq_stmt = $conn->prepare("SELECT * FROM faqs WHERE post_id = ? ORDER BY order_num");
                $faq_stmt->bind_param("s", $id);
                $faq_stmt->execute();
                $faq_result = $faq_stmt->get_result();
                $post['faqs'] = $faq_result->fetch_all(MYSQLI_ASSOC);
                
                sendJSON($post);
            } else {
                sendJSON(['error' => 'Post not found'], 404);
            }
        } else {
            // Get all posts
            $published_only = !isset($_GET['admin']);
            
            if ($published_only) {
                $result = $conn->query("SELECT * FROM blog_posts WHERE published = 1 ORDER BY date DESC");
            } else {
                $result = $conn->query("SELECT * FROM blog_posts ORDER BY date DESC");
            }
            
            $posts = [];
            while ($row = $result->fetch_assoc()) {
                $row['tags'] = json_decode($row['tags'], true);
                $row['published'] = (bool)$row['published'];
                $posts[] = $row;
            }
            
            sendJSON($posts);
        }
        break;
        
    case 'POST':
        // Check authentication
        if (!isset($_SESSION['admin_logged_in']) || !$_SESSION['admin_logged_in']) {
            sendJSON(['error' => 'Unauthorized'], 401);
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $conn->prepare("INSERT INTO blog_posts (id, title, excerpt, content, category, tags, image, author, date, read_time, published, meta_title, meta_description, meta_keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $tags_json = json_encode($data['tags']);
        $published = $data['published'] ? 1 : 0;
        
        $stmt->bind_param("sssssssssissss",
            $data['id'],
            $data['title'],
            $data['excerpt'],
            $data['content'],
            $data['category'],
            $tags_json,
            $data['image'],
            $data['author'],
            $data['date'],
            $data['readTime'],
            $published,
            $data['metaTitle'],
            $data['metaDescription'],
            $data['metaKeywords']
        );
        
        if ($stmt->execute()) {
            // Handle FAQs
            if (isset($data['faqs']) && is_array($data['faqs'])) {
                $faq_stmt = $conn->prepare("INSERT INTO faqs (post_id, question, answer, order_num) VALUES (?, ?, ?, ?)");
                foreach ($data['faqs'] as $index => $faq) {
                    $faq_stmt->bind_param("sssi", $data['id'], $faq['question'], $faq['answer'], $index);
                    $faq_stmt->execute();
                }
            }
            
            sendJSON(['success' => true, 'id' => $data['id']]);
        } else {
            sendJSON(['error' => 'Failed to create post', 'message' => $stmt->error], 500);
        }
        break;
        
    case 'PUT':
        if (!isset($_SESSION['admin_logged_in']) || !$_SESSION['admin_logged_in']) {
            sendJSON(['error' => 'Unauthorized'], 401);
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $conn->prepare("UPDATE blog_posts SET title=?, excerpt=?, content=?, category=?, tags=?, image=?, author=?, date=?, read_time=?, published=?, meta_title=?, meta_description=?, meta_keywords=?, updated_at=CURRENT_TIMESTAMP WHERE id=?");
        
        $tags_json = json_encode($data['tags']);
        $published = $data['published'] ? 1 : 0;
        
        $stmt->bind_param("sssssssssissss",
            $data['title'],
            $data['excerpt'],
            $data['content'],
            $data['category'],
            $tags_json,
            $data['image'],
            $data['author'],
            $data['date'],
            $data['readTime'],
            $published,
            $data['metaTitle'],
            $data['metaDescription'],
            $data['metaKeywords'],
            $data['id']
        );
        
        if ($stmt->execute()) {
            // Update FAQs
            if (isset($data['faqs'])) {
                // Delete old FAQs
                $conn->query("DELETE FROM faqs WHERE post_id = '" . $conn->real_escape_string($data['id']) . "'");
                
                // Insert new FAQs
                if (is_array($data['faqs']) && count($data['faqs']) > 0) {
                    $faq_stmt = $conn->prepare("INSERT INTO faqs (post_id, question, answer, order_num) VALUES (?, ?, ?, ?)");
                    foreach ($data['faqs'] as $index => $faq) {
                        $faq_stmt->bind_param("sssi", $data['id'], $faq['question'], $faq['answer'], $index);
                        $faq_stmt->execute();
                    }
                }
            }
            
            sendJSON(['success' => true]);
        } else {
            sendJSON(['error' => 'Failed to update post'], 500);
        }
        break;
        
    case 'DELETE':
        if (!isset($_SESSION['admin_logged_in']) || !$_SESSION['admin_logged_in']) {
            sendJSON(['error' => 'Unauthorized'], 401);
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $conn->real_escape_string($data['id']);
        
        $stmt = $conn->prepare("DELETE FROM blog_posts WHERE id = ?");
        $stmt->bind_param("s", $id);
        
        if ($stmt->execute()) {
            sendJSON(['success' => true]);
        } else {
            sendJSON(['error' => 'Failed to delete post'], 500);
        }
        break;
        
    default:
        sendJSON(['error' => 'Method not allowed'], 405);
}

$conn->close();
?>