/* Hide elements on mobile when toggled */
.hide-mobile {
  display: none;
}

/* Chat Header */
.chat-header {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f1f1f1;
  border-bottom: 1px solid #ddd;
}

.back-btn {
  margin-right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
  }
  .chat-area {
    width: 100%;
  }
}

