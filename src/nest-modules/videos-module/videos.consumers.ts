import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, ValidationPipe } from '@nestjs/common';
import { ProcessAudioVideoMediasInput } from '../../core/video/application/use-cases/process-audio-video-medias/process-audio-video-medias.input';
import { AudioVideoMediaStatus } from '../../core/shared/domain/value-objects/audio-video-media.vo';
@Injectable()
export class VideosConsumers {
  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'videos.convert',
    queue: 'micro-videos/admin',
    allowNonJsonMessages: true,
  })
  async onProcessVideo(msg: {
    video: {
      resource_id: string;
      encoded_video_folder: string;
      status: 'COMPLETED' | 'FAILED';
    };
  }) {
    const resource_id = `${msg.video?.resource_id}`;
    const [video_id, field] = resource_id.split('.');
    const input = new ProcessAudioVideoMediasInput({
      video_id,
      field: field as 'trailer' | 'video',
      encoded_location: msg.video?.encoded_video_folder,
      status: msg.video?.status as AudioVideoMediaStatus,
    });
    try {
      await new ValidationPipe({
        errorHttpStatusCode: 422,
      }).transform(input, {
        metatype: ProcessAudioVideoMediasInput,
        type: 'body',
      });
    } catch (e) {
      console.error(e);
    }
  }
}