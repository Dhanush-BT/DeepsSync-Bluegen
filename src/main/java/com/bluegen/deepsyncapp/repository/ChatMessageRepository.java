package com.bluegen.deepsyncapp.repository;

import com.bluegen.deepsyncapp.entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {

    List<ChatMessageEntity> findBySessionIdOrderByTimestampAsc(String sessionId);
}
